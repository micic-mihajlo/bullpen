"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from "recharts";

const data = [
  {
    name: "Landing pages",
    traditional: 30,
    bullpen: 1.5,
    traditionalLabel: "3-6 weeks",
    bullpenLabel: "1-2 days",
  },
  {
    name: "Email automations",
    traditional: 21,
    bullpen: 0.5,
    traditionalLabel: "2-4 weeks",
    bullpenLabel: "Same day",
  },
  {
    name: "API integrations",
    traditional: 17,
    bullpen: 2,
    traditionalLabel: "2-3 weeks",
    bullpenLabel: "1-3 days",
  },
  {
    name: "Dashboards",
    traditional: 56,
    bullpen: 10,
    traditionalLabel: "6-10 weeks",
    bullpenLabel: "1-2 weeks",
  },
  {
    name: "Web apps",
    traditional: 84,
    bullpen: 21,
    traditionalLabel: "8-16 weeks",
    bullpenLabel: "2-4 weeks",
  },
  {
    name: "Mobile apps",
    traditional: 126,
    bullpen: 28,
    traditionalLabel: "12-24 weeks",
    bullpenLabel: "3-6 weeks",
  },
  {
    name: "Bug fixes",
    traditional: 10,
    bullpen: 0.5,
    traditionalLabel: "1-2 weeks",
    bullpenLabel: "Same day",
  },
  {
    name: "CRM migrations",
    traditional: 42,
    bullpen: 10,
    traditionalLabel: "4-8 weeks",
    bullpenLabel: "1-2 weeks",
  },
];

const CustomYAxisTick = ({ x, y, payload }: any) => {
  return (
    <text
      x={x}
      y={y}
      textAnchor="end"
      fill="rgba(28, 25, 23, 0.8)"
      fontSize="13"
      fontFamily="Inter, sans-serif"
      dy={4}
    >
      {payload.value}
    </text>
  );
};

const CustomXAxisTick = ({ x, y, payload }: any) => {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill="rgba(28, 25, 23, 0.5)"
      fontSize="11"
      fontFamily="JetBrains Mono, monospace"
      dy={16}
    >
      {payload.value}d
    </text>
  );
};

export function SpeedStrip() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-bg overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-3">
            Delivery Speed
          </p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-text mb-6">
            Months? No. Days.
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-8">
            Same quality. Human-reviewed. You watch every step.
          </p>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-text/20" />
              <span className="font-mono text-xs text-muted">Traditional Agency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-accent" />
              <span className="font-mono text-xs text-accent font-semibold">Bullpen</span>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-surface rounded-lg border border-border p-4 sm:p-8 shadow-lg"
        >
          <ResponsiveContainer width="100%" height={600}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(28, 25, 23, 0.1)"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                stroke="rgba(28, 25, 23, 0.3)"
                tick={<CustomXAxisTick />}
                tickLine={false}
                axisLine={{ stroke: "rgba(28, 25, 23, 0.2)" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="rgba(28, 25, 23, 0.3)"
                tick={<CustomYAxisTick />}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Bar
                dataKey="traditional"
                fill="rgba(28, 25, 23, 0.2)"
                radius={[0, 4, 4, 0]}
                animationDuration={800}
                animationBegin={0}
              >
                <LabelList
                  dataKey="traditionalLabel"
                  position="right"
                  style={{
                    fill: "rgba(28, 25, 23, 0.6)",
                    fontSize: "12px",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
              </Bar>
              <Bar
                dataKey="bullpen"
                fill="#E85D26"
                radius={[0, 4, 4, 0]}
                animationDuration={800}
                animationBegin={200}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#E85D26" />
                ))}
                <LabelList
                  dataKey="bullpenLabel"
                  position="right"
                  style={{
                    fill: "#E85D26",
                    fontSize: "13px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 600,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16 pt-12 border-t border-border"
        >
          <div className="grid grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto mb-8">
            <div>
              <div className="font-display text-3xl sm:text-4xl text-accent mb-2">10x</div>
              <div className="text-xs sm:text-sm text-text-secondary">Faster</div>
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl text-accent mb-2">100%</div>
              <div className="text-xs sm:text-sm text-text-secondary">Reviewed</div>
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl text-accent mb-2">0</div>
              <div className="text-xs sm:text-sm text-text-secondary">Surprises</div>
            </div>
          </div>
          <p className="text-sm sm:text-base text-text font-medium">
            Stop waiting. Start shipping.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
