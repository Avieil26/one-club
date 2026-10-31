import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import type { FcPlayer } from '@/lib/fcPlayers';

/**
 * The provider image is the COMPLETE Scream card (frame, portrait and stats).
 * Render it exactly once. Never wrap it in another invented shield/background.
 */
export function Scream2Portrait({ player, width }: {player: FcPlayer; width: number}) {
  const [failed, setFailed] = useState(false);
  const itemId = (player as FcPlayer & {itemId?:number}).itemId ?? (player.id === 'scream2-reijnders-sbc-20261030' ? 50572286 : undefined);
  const height = Math.round(width * 419 / 300);
  if (!Number.isInteger(itemId) || !itemId || failed) {
    return <View style={{width,height,justifyContent:'center',alignItems:'center',backgroundColor:'transparent'}}>
      <Text style={{color:'#F5E9D3',textAlign:'center',fontWeight:'800'}}>{player.en || player.name}</Text>
      <Text style={{color:'#F5E9D3'}}>{player.rating} {player.position}</Text>
    </View>;
  }
  return <Image
    accessibilityLabel={`${player.en || player.name} ${player.rating} Ultimate Scream`}
    source={{uri:`https://assets.fodder.gg/renders/${itemId}.webp`}}
    onError={() => setFailed(true)}
    resizeMode="contain"
    style={{width,height}}
  />;
}
