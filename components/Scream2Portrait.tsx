import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, RadialGradient, Stop, Path, Ellipse } from 'react-native-svg';
import type { FcPlayer } from '@/lib/fcPlayers';
import { playerMedia } from '@/lib/playerMedia';
import { NationFlag } from '@/components/NationFlag';

/** Team 2 preview renderer: purple/orange Scream chrome, no counterfeit item image. */
export function Scream2Portrait({player,width}: {player:FcPlayer;width:number}) {
  const height=width*419/300;
  const media=playerMedia(player.baseId || player.id);
  const [cutoutUnavailable,setCutoutUnavailable]=useState(false);
  const [backupUnavailable,setBackupUnavailable]=useState(false);
  const itemId = (player as FcPlayer & {itemId?:number}).itemId || (player.id === 'scream2-reijnders-sbc-20261030' ? 50572286 : 0);
  const remoteCutout = itemId > 0 ? 'https://assets.fodder.gg/renders/' + itemId + '.webp' : '';
  const photoUrl = !cutoutUnavailable && remoteCutout ? remoteCutout : !backupUnavailable ? media.photo : undefined;
  const face=player.face;
  const fields:[string,number|undefined][]=[['PAC',face?.pac],['SHO',face?.sho],['PAS',face?.pas],['DRI',face?.dri],['DEF',face?.def],['PHY',face?.phy]];
  const ratio=width/300;
  return <View style={{width,height,overflow:'hidden',position:'relative'}} accessibilityLabel={`${player.en || player.name} ${player.rating} Ultimate Scream Team 2`}>
    <Svg width={width} height={height} viewBox="0 0 300 419" style={{position:'absolute'}}>
      <Defs>
        <SvgLinearGradient id="screamFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#200919"/><Stop offset=".25" stopColor="#8B213C"/><Stop offset=".53" stopColor="#F57C25"/><Stop offset=".78" stopColor="#692357"/><Stop offset="1" stopColor="#1A0925"/>
        </SvgLinearGradient>
        <SvgLinearGradient id="screamBorder" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FED38A"/><Stop offset=".23" stopColor="#9E43A4"/><Stop offset=".46" stopColor="#F98C22"/><Stop offset=".72" stopColor="#FFDC8E"/><Stop offset="1" stopColor="#A340A7"/>
        </SvgLinearGradient>
        <SvgLinearGradient id="screamBottom" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#531D36" stopOpacity="0"/><Stop offset=".3" stopColor="#922E46" stopOpacity=".88"/><Stop offset="1" stopColor="#24101B" stopOpacity=".98"/>
        </SvgLinearGradient>
        <RadialGradient id="screamFire" cx="0.68" cy="0.26" rx="0.68" ry="0.65">
          <Stop offset="0" stopColor="#FFE268" stopOpacity=".9"/><Stop offset=".45" stopColor="#F4571A" stopOpacity=".5"/><Stop offset="1" stopColor="#4F1350" stopOpacity="0"/>
        </RadialGradient>
      </Defs>
      <Path d="M26 31 L71 19 L119 8 L148 19 L180 4 L234 21 L272 31 L280 83 L276 358 L264 390 L150 414 L36 390 L22 357 L20 81 Z" fill="#8A35B6" stroke="#A763F5" strokeWidth="12" opacity=".53"/>
      <Path d="M28 28 L75 16 L118 9 L148 17 L180 9 L230 18 L272 31 L279 84 L275 357 L264 384 L150 406 L36 384 L24 356 L23 86 Z" fill="url(#screamFill)" stroke="url(#screamBorder)" strokeWidth="6"/>
      <Path d="M37 36 L76 24 L119 17 L150 25 L182 17 L230 26 L262 38 L266 82 L262 355 L254 374 L150 395 L47 375 L38 354 L35 87 Z" fill="url(#screamFire)" stroke="#FAB151" strokeWidth="1.5"/>
      <Path d="M60 0 Q112 40 137 15 Q163 67 206 12 Q231 53 279 31 L241 77 Q190 55 165 107 Q137 63 99 91 Q77 54 33 60 Z" fill="#F77B26" opacity=".83"/>
      <Path d="M105 4 Q145 42 185 14 Q218 55 262 24 Q236 102 180 88 Q163 142 136 113 Q103 96 70 72 Z" fill="#A13AE0" opacity=".65"/>
      <Path d="M173 78 L231 93 L203 124 L240 112 L214 146 L235 138 L200 163 L174 142 L147 158 L154 126 Z" fill="#2E0B36" opacity=".74"/>
      <Path d="M173 83 L210 96 L192 112 L207 119 L184 134 L165 112 Z" fill="#FF8B20" opacity=".85"/>
      <Ellipse cx="149" cy="145" rx="121" ry="121" fill="url(#screamFire)" opacity=".7"/>
      <Path d="M44 292 Q89 259 127 294 Q174 274 264 295 L262 355 L253 374 L150 394 L47 372 L40 357 Z" fill="url(#screamBottom)"/>
      <Path d="M28 28 L75 16 L118 9 L148 17 L180 9 L230 18 L272 31 L279 84 L275 357 L264 384 L150 406 L36 384 L24 356 L23 86 Z" fill="none" stroke="#FFA43D" strokeWidth="2"/>
    </Svg>
    {photoUrl ? <Image source={{uri:photoUrl}} onError={()=>{ if(!cutoutUnavailable) setCutoutUnavailable(true); else setBackupUnavailable(true); }} resizeMode="contain" style={{position:'absolute',top:height*.12,left:width*.22,width:width*.72,height:height*.51}}/> : <Text style={{position:'absolute',top:height*.28,left:width*.29,color:'#F6B963',fontSize:width*.3,fontWeight:'900'}}>{(player.en || player.name).slice(0,1)}</Text>}
    <View style={{position:'absolute',left:width*.09,top:height*.16}}>
      <Text style={{color:'#FFF5DA',fontSize:width*.13,fontWeight:'900',lineHeight:width*.145,textShadowColor:'#351024',textShadowRadius:4}}>{player.rating}</Text>
      <Text style={{color:'#FFF5DA',fontSize:width*.066,fontWeight:'800'}}>{player.position}</Text>
    </View>
    <Text numberOfLines={1} adjustsFontSizeToFit style={{position:'absolute',top:height*.634,left:width*.1,width:width*.8,textAlign:'center',fontSize:width*.081,fontWeight:'900',color:'#FFF1DC',textShadowColor:'#381225',textShadowRadius:5}}>{player.en || player.name}</Text>
    <View style={{position:'absolute',top:height*.752,left:width*.11,width:width*.78,flexDirection:'row',justifyContent:'space-between'}}>
      {fields.map(([name,value])=><View key={name} style={{alignItems:'center'}}><Text style={{fontSize:width*.038,fontWeight:'800',color:'#FFE9C4'}}>{name}</Text><Text style={{fontSize:width*.065,fontWeight:'900',color:'#FFF7EE'}}>{value ?? '—'}</Text></View>)}
    </View>
    <View style={{position:'absolute',bottom:height*.09,alignSelf:'center',flexDirection:'row',alignItems:'center',gap:width*.045}}>
      <NationFlag nation={player.nation} size={width*.095}/>
      <Text style={{fontSize:width*.043,color:'#FFCB86',fontWeight:'900'}}>ULTIMATE SCREAM</Text>
    </View>
  </View>;
}
