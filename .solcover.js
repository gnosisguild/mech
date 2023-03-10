module.exports = {
  skipFiles: [
    "libraries/SafeMigration.sol", // this is only tested with integration tests, not the standard unit tests
    "test", // we don't care about the contracts we just use for testing purposes
  ],
}
