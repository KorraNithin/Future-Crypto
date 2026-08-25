const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '')

export const apiEndpoint = (path) => `${apiUrl}${path}`
