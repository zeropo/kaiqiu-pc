export function useHtmlDecode() {
  const decode = (str = '') => {
    try {
      const s = decodeURIComponent(str)
      return s
    } catch (e) {
      return str
    }
  }
  return { decode }
}

