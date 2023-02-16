import { useState, useEffect } from "react"

const useTokenUrl = (tokenUrl: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!tokenUrl) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      if (tokenUrl.slice(0, 4) === "http") {
        try {
          const response = await fetch(tokenUrl)
          const data = await response.json()
          setData(data)
          setIsLoading(false)
        } catch (e) {
          setError(e)
          setIsLoading(false)
        }
      } else if (tokenUrl.slice(0, 29) === "data:application/json;base64,") {
        const json = Buffer.from(tokenUrl.slice(29), "base64").toString()
        setData(JSON.parse(json))
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tokenUrl])

  return { isLoading, data, error }
}

export default useTokenUrl
