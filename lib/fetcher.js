export const fetcher = (url) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Network error")
    return r.json()
  })
