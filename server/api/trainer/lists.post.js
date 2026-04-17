import { createCachedPostProxyHandler } from '../_utils/cache'

export default createCachedPostProxyHandler('/trainer/lists', { maxAge: 120 })
