-- KEYS[1] = queueKey
-- KEYS[2] = roomKeyPrefix (如 'mm:room:')
-- ARGV[1] = roomId

local a = redis.call('RPOP', KEYS[1])
if not a then return { 'empty' } end
local b = redis.call('RPOP', KEYS[1])
if not b then
  redis.call('RPUSH', KEYS[1], a) -- 放回，保持队列完整
  return { 'single' }
end
redis.call('HSET', KEYS[2] .. ARGV[1], 'a', a, 'b', b)
return { 'paired', a, b }