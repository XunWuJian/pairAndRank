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
local roomKey = KEYS[2] .. ARGV[1]
redis.call('HSET', roomKey, 'a', a)
redis.call('HSET', roomKey, 'b', b)
redis.call('EXPIRE', roomKey, 60)
-- 玩家到房间映射（便于按玩家查询配对结果）
redis.call('SET', 'mm:player-room:' .. a, ARGV[1])
redis.call('EXPIRE', 'mm:player-room:' .. a, 60)
redis.call('SET', 'mm:player-room:' .. b, ARGV[1])
redis.call('EXPIRE', 'mm:player-room:' .. b, 60)
return { 'paired', a, b }