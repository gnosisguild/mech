// SPDX-License-Identifier: MIT

// Forked from https://github.com/0xsequence/sstore2/blob/master/contracts/utils/Bytecode.sol
// MIT License
// Copyright (c) [2018] [Ismael Ramos Silvan]
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

pragma solidity ^0.8.12;

library WriteOnce {
    /**
     * @notice Generate a creation code that results on a contract with `00${_value}` as bytecode
     * @param data The value to store in the bytecode
     * @return creationCode (constructor) for new contract
     */
    function creationCodeFor(
        bytes memory data
    ) internal pure returns (bytes memory) {
        /*
          0x00    0x63         0x63XXXXXX  PUSH4 _value.length  size
          0x01    0x80         0x80        DUP1                size size
          0x02    0x60         0x600e      PUSH1 14            14 size size
          0x03    0x60         0x6000      PUSH1 00            0 14 size size
          0x04    0x39         0x39        CODECOPY            size
          0x05    0x60         0x6000      PUSH1 00            0 size
          0x06    0xf3         0xf3        RETURN
          <CODE>
        */

        // Prepend 00 so the created contract can't be called
        return
            abi.encodePacked(
                hex"63",
                uint32(data.length + 1),
                hex"80_60_0E_60_00_39_60_00_F3",
                hex"00",
                data
            );
    }

    /**
     * @notice Returns the size of the code on a given address
     * @param _addr Address that may or may not contain code
     * @return size of the code on the given `_addr`
     */
    function codeSize(address _addr) internal view returns (uint256 size) {
        assembly {
            size := extcodesize(_addr)
        }
    }

    /**
     * @notice Returns the value stored in the bytecode of the given address
     * @param _addr Address that may or may not contain code
     * @return _value The value stored in the bytecode of the given address
     *
     * Forked from: https://gist.github.com/KardanovIR/fe98661df9338c842b4a30306d507fbd
     **/
    function valueStoredAt(
        address _addr
    ) internal view returns (bytes memory _value) {
        uint256 size = codeSize(_addr);
        if (size <= 1) return bytes("");
        size--; // remove 00 byte we prepend when writing

        unchecked {
            assembly {
                // allocate output byte array - this could also be done without assembly
                // by using o_code = new bytes(size)
                _value := mload(0x40)
                // new "memory end" including padding
                mstore(
                    0x40,
                    add(_value, and(add(add(size, 0x20), 0x1f), not(0x1f)))
                )
                // store length in memory
                mstore(_value, size)
                // actually retrieve the code, this needs assembly
                // start at offset 1 to skip over 00 byte we prepend when writing
                extcodecopy(_addr, add(_value, 0x20), 1, size)
            }
        }
    }
}
