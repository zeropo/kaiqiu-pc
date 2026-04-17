import { createCachedPostProxyHandler } from '../_utils/cache'

export default createCachedPostProxyHandler('/user/lists', { maxAge: 120 })
