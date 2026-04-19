import React from 'react';

const SUIT_COLORS = {
  NAVIGATOR: '#0088ff',
  SCIENCE: '#00ff88',
  WEAPONS: '#ff4444',
  CAPTAIN: '#ffd700',
};

export const CardHand = ({ hand, ap, cardsPlayed, maxCardsPerTurn, selectedCardId, onSelectCard }) => {
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      alignItems: 'flex-end',
      padding: '0 20px',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      flexShrink: 0,
    }}>
      {hand.map((card, i) => {
        const suitColor = SUIT_COLORS[card.suit?.toUpperCase()] || '#ffffff';
        const isSelected = selectedCardId === card.instanceId;
        const canAfford = ap >= card.cost;
        const canPlay = canAfford && cardsPlayed < maxCardsPerTurn;
        const disabled = !canPlay;

        return (
          <div
            key={card.instanceId}
            onClick={() => !disabled && onSelectCard(isSelected ? null : card.instanceId)}
            style={{
              width: 100,
              minHeight: 140,
              background: isSelected
                ? `linear-gradient(180deg, ${suitColor}33, ${suitColor}22)`
                : 'linear-gradient(180deg, #0a1a10, #050d08)',
              border: `2px solid ${isSelected ? suitColor : disabled ? '#333' : suitColor + '88'}`,
              borderRadius: 4,
              padding: 8,
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              opacity: disabled ? 0.45 : 1,
              transform: isSelected ? 'translateY(-14px)' : 'none',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
              flexShrink: 0,
              boxShadow: isSelected ? `0 0 18px ${suitColor}88` : 'none',
              userSelect: 'none',
            }}
          >
            {/* Suit label */}
            <div style={{
              fontSize: 7,
              fontFamily: "'Press Start 2P', monospace",
              color: suitColor,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              {card.suit || '?'}
            </div>

            {/* Card name */}
            <div style={{
              fontSize: 8,
              fontFamily: "'Press Start 2P', monospace",
              color: '#fff',
              lineHeight: 1.4,
              flexGrow: 1,
              marginTop: 4,
            }}>
              {card.name}
            </div>

            {/* Description */}
            <div style={{
              fontSize: 6,
              color: '#aaa',
              fontFamily: 'monospace',
              lineHeight: 1.4,
              borderTop: `1px solid ${suitColor}44`,
              paddingTop: 4,
              marginTop: 4,
            }}>
              {card.description}
            </div>

            {/* Cost row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 4,
              fontSize: 8,
              fontFamily: "'Press Start 2P', monospace",
            }}>
              <span style={{ color: '#ffd700' }}>{card.cost} AP</span>
              {card.heatGenerated > 0 && (
                <span style={{ color: '#ff6600' }}>+{card.heatGenerated}🌡</span>
              )}
            </div>
          </div>
        );
      })}

      {hand.length === 0 && (
        <div style={{ color: '#444', fontFamily: "'Press Start 2P', monospace", fontSize: 10, padding: 20 }}>
          NO CARDS IN HAND
        </div>
      )}
    </div>
  );
};
