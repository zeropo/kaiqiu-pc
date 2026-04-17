import { createCachedPostProxyHandler } from '../_utils/cache'

export default createCachedPostProxyHandler('/match/lists', { maxAge: 90 })
