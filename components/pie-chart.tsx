"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface PieSlice {
  name: string
  value: number
  color: string
  percentage: number
}

interface CustomPieChartProps {
  data: PieSlice[]
  size?: number
  innerRadius?: number
  outerRadius?: number
}

export function CustomPieChart({ data, size = 280, innerRadius = 60, outerRadius = 100 }: CustomPieChartProps) {
  const center = size / 2
  const [hoveredSlice, setHoveredSlice] = useState<PieSlice | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Calculate total value
  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) return null

  // Generate pie slices
  let currentAngle = -90 // Start from top
  const slices = data.map((item, index) => {
    const percentage = item.value / total
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    // Calculate arc path
    const x1Outer = center + outerRadius * Math.cos(startRad)
    const y1Outer = center + outerRadius * Math.sin(startRad)
    const x2Outer = center + outerRadius * Math.cos(endRad)
    const y2Outer = center + outerRadius * Math.sin(endRad)

    const x1Inner = center + innerRadius * Math.cos(endRad)
    const y1Inner = center + innerRadius * Math.sin(endRad)
    const x2Inner = center + innerRadius * Math.cos(startRad)
    const y2Inner = center + innerRadius * Math.sin(startRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathData = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x2Inner} ${y2Inner}`,
      `Z`,
    ].join(" ")

    const midAngle = (startAngle + endAngle) / 2
    const midRad = (midAngle * Math.PI) / 180
    const midRadius = (innerRadius + outerRadius) / 2
    const midX = center + midRadius * Math.cos(midRad)
    const midY = center + midRadius * Math.sin(midRad)

    return {
      ...item,
      pathData,
      startAngle,
      endAngle,
      midX,
      midY,
      index,
    }
  })

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice, index) => (
          <motion.path
            key={slice.name}
            d={slice.pathData}
            fill={slice.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: hoveredSlice?.name === slice.name ? 1.05 : 1,
            }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            style={{
              transformOrigin: `${center}px ${center}px`,
              cursor: "pointer",
              filter: hoveredSlice?.name === slice.name ? "brightness(1.2)" : "none",
            }}
            onMouseEnter={(e) => {
              setHoveredSlice(slice)
              setTooltipPos({ x: slice.midX, y: slice.midY })
            }}
            onMouseLeave={() => setHoveredSlice(null)}
          />
        ))}
      </svg>

      {hoveredSlice && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute pointer-events-none z-10 bg-gray-900/95 border border-gray-700 rounded-lg px-3 py-2 shadow-xl"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredSlice.color }} />
            <span className="font-medium text-white">{hoveredSlice.name}</span>
          </div>
          <div className="text-sm text-gray-300 mt-1">
            <span className="text-cyan-400 font-semibold">{Math.round((hoveredSlice.value / 60) * 10) / 10}h</span>
            <span className="text-gray-500 ml-2">({hoveredSlice.percentage.toFixed(1)}%)</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
