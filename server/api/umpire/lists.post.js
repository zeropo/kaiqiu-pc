import { createCachedPostProxyHandler } from '../_utils/cache'

export default createCachedPostProxyHandler('/umpire/lists', { maxAge: 120 })
