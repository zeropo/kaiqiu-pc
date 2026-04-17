import { createCachedPostProxyHandler } from '../_utils/cache'

export default createCachedPostProxyHandler('/Top/lists', { maxAge: 120 })
