import React from 'react';
import './VFXLayer.css';

export default function VFXLayer({ vfxQueue, tileSize = 50 }) {
    if (!vfxQueue || vfxQueue.length === 0) return null;

    // Helper to map grid coordinates (x,y) to pixel center-points
    const getCenter = (coord) => ({
        x: coord.x * tileSize + (tileSize / 2),
        y: coord.y * tileSize + (tileSize / 2)
    });

    return (
        <div className="vfx-overlay">
            {/* SVG Layer for rendering vector lines like Laser Beams */}
            <svg className="vfx-svg-layer">
                {vfxQueue.map(vfx => {
                    const start = getCenter(vfx.source);
                    const end = getCenter(vfx.target);
                    const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

                    if (vfx.type === 'beam') {
                        return (
                            <line key={vfx.id} x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                                stroke={vfx.color} strokeWidth="4" className="vfx-beam" />
                        );
                    }
                    if (vfx.type === 'kinetic') {
                        return (
                            <line key={vfx.id} x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                                stroke={vfx.color} strokeWidth="2" className="vfx-kinetic" style={{ '--path-length': `${length}px` }} />
                        );
                    }
                    if (vfx.type === 'missile') {
                        return (
                            <line key={vfx.id} x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                                stroke={vfx.color} strokeWidth="3" className="vfx-missile" style={{ '--path-length': `${length}px` }} />
                        );
                    }
                    if (vfx.type === 'tether') {
                        return (
                            <line key={vfx.id} x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                                stroke={vfx.color} strokeWidth="2" className="vfx-tether" strokeDasharray="6 6" />
                        );
                    }
                    return null;
                })}
            </svg>

            {/* HTML Layer for rendering node-based animations like Explosions */}
            {vfxQueue.map(vfx => {
                const center = getCenter(vfx.target);
                if (vfx.type === 'explosion' || vfx.type === 'ship_explosion') {
                    const size = vfx.type === 'ship_explosion' ? 100 : 40;
                    return (
                        <div key={vfx.id} className={`vfx-explosion ${vfx.type}`}
                            style={{
                                left: center.x - size / 2,
                                top: center.y - size / 2,
                                width: size, height: size,
                                backgroundColor: vfx.color,
                                boxShadow: `0 0 25px ${vfx.color}`
                            }} />
                    );
                }
                return null;
            })}
        </div>
    );
}