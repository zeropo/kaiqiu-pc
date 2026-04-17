import { createCachedPostProxyHandler } from '../_utils/cache'

export default createCachedPostProxyHandler('/arena/lists', { maxAge: 120 })
