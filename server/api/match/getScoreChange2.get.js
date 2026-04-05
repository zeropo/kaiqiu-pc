import proxy from '../_utils/request'

export default defineEventHandler(async (event) => {
  return await proxy(event, 'GET', '/Match/getScoreChange2')
})
