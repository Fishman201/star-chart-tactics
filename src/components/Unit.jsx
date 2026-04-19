import React from 'react';

export const Unit = ({ unit, isSelected, tileSize, factionColor }) => {
  const hpPercent = (unit.hp / unit.maxHp) * 100;
  
  // Choose simple ASCII/Unicode representations for different ships
  let symbol = '▲';
  if (unit.classId === 'titan') symbol = '⬛';
  if (unit.classId === 'frigate') symbol = '⬟';

  return (
    <div style={{
      position: 'absolute',
      left: unit.x * tileSize,
      top: unit.y * tileSize,
      width: tileSize,
      height: tileSize,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
      border: isSelected ? `2px dashed ${factionColor}` : 'none',
      color: factionColor,
      transition: 'left 0.3s, top 0.3s',
      pointerEvents: 'none', // Handled by grid tile
      zIndex: 10
    }}>
      <div style={{ fontSize: unit.classId === 'titan' ? '24px' : '16px' }}>{symbol}</div>
      <div style={{
          position: 'absolute', bottom: -5, left: 0, width: '100%', height: 4, background: '#333'
      }}>
          <div style={{ width: `${hpPercent}%`, height: '100%', background: hpPercent > 40 ? '#0f0' : '#f00' }} />
      </div>

      {(unit.hasMoved || unit.hasAttacked) && (
          <div style={{ position: 'absolute', top: -5, right: -5, width: 8, height: 8, background: '#888', borderRadius: '50%' }} />
      )}
    </div>
  );
};
