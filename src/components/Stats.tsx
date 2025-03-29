import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import CountUp from "react-countup"

const stats = [
  {
    value: 2.5,
    suffix: "M+",
    label: "Active Players",
    color: "text-purple-400",
    decimal: true
  },
  {
    value: 100,
    prefix: "",
    suffix: "+",
    label: "All Ages Welcome",
    color: "text-pink-400",
    decimal: false
  },
  {
    value: 30,
    prefix: "<",
    suffix: "min",
    label: "To Learn Basics",
    color: "text-blue-400",
    decimal: false
  },
  {
    value: 39.3,
    suffix: "%",
    label: "Growth Rate",
    color: "text-pink-400",
    decimal: true
  }
]

const StatsCard = ({ stat, index }: { stat: typeof stats[0], index: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="bg-gray-800/50 backdrop-blur-sm text-center p-6 rounded-xl shadow-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <h2 className={`text-4xl font-bold ${stat.color}`}>
        {stat.prefix}
        {inView ? (
          <CountUp
            end={stat.value}
            duration={2.5}
            decimals={stat.decimal ? 1 : 0}
            separator=","
          />
        ) : "0"}
        {stat.suffix}
      </h2>
      <p className="text-gray-300 mt-2 font-medium">{stat.label}</p>
    </motion.div>
  )
}

const Stats = () => {
  return (
    <section className="py-12 relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto gap-6 px-4">
        {stats.map((stat, index) => (
          <StatsCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>
    </section>
  )
}

export default Stats 