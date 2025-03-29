import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Card, CardContent } from "./ui/card"
import { Heart, Users, Brain, Activity, Trophy, Clock, Shield, Zap } from "lucide-react"

const benefits = [
  {
    title: "Physical Health",
    icon: Activity,
    color: "purple",
    description: "Enhance your fitness with low-impact, high-reward exercise",
    items: [
      "Improves cardiovascular health",
      "Enhances balance and agility",
      "Low-impact exercise option",
      "Burns calories effectively"
    ]
  },
  {
    title: "Social Benefits",
    icon: Users,
    color: "pink",
    description: "Connect with a vibrant community of players",
    items: [
      "Build lasting friendships",
      "Community engagement",
      "Family-friendly activity",
      "Regular social interaction"
    ]
  },
  {
    title: "Mental Wellness",
    icon: Brain,
    color: "blue",
    description: "Boost cognitive function and mental health",
    items: [
      "Reduces stress and anxiety",
      "Boosts cognitive function",
      "Increases mental focus",
      "Improves decision-making"
    ]
  },
  {
    title: "Competitive Spirit",
    icon: Trophy,
    color: "amber",
    description: "Challenge yourself and grow as a player",
    items: [
      "Tournament opportunities",
      "Skill progression",
      "Goal setting",
      "Achievement rewards"
    ]
  }
]

const statsData = [
  { value: "300%", label: "Growth Rate Since 2019", icon: Zap, color: "pink" },
  { value: "4.8M", label: "Active Players", icon: Users, color: "purple" },
  { value: "35+", label: "Average Age Range", icon: Clock, color: "blue" },
  { value: "9,000+", label: "Registered Facilities", icon: Shield, color: "amber" }
]

const BenefitCard = ({ benefit, index }: { benefit: typeof benefits[0], index: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  const Icon = benefit.icon
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="h-full"
    >
      <Card className="bg-[#1E1E1E] h-full border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20 group">
        <CardContent className="p-6">
          <motion.div 
            className="flex items-center gap-4 mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
          >
            <div className={`p-2 rounded-lg bg-${benefit.color}-500/10 group-hover:bg-${benefit.color}-500/20 transition-colors duration-300`}>
              <Icon className={`w-6 h-6 text-${benefit.color}-400`} />
            </div>
            <h3 className={`text-xl font-bold text-${benefit.color}-400`}>
              {benefit.title}
            </h3>
          </motion.div>
          
          <motion.p
            className="text-gray-400 text-sm mb-4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.2 + 0.4 }}
          >
            {benefit.description}
          </motion.p>
          
          <motion.ul 
            className="space-y-2 text-sm"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.2 + 0.5 }}
          >
            {benefit.items.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: index * 0.2 + 0.6 + (i * 0.1) }}
                className="flex items-center text-gray-300"
              >
                <Heart className={`w-4 h-4 mr-2 text-${benefit.color}-400 flex-shrink-0`} />
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const StatCard = ({ stat, index }: { stat: typeof statsData[0], index: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  const Icon = stat.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
      <Card className="bg-[#1E1E1E]/50 backdrop-blur-sm border-gray-800 relative">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
            className={`mx-auto w-12 h-12 rounded-full bg-${stat.color}-500/10 flex items-center justify-center mb-4`}
          >
            <Icon className={`w-6 h-6 text-${stat.color}-400`} />
          </motion.div>
          <motion.p
            className={`text-4xl font-bold text-${stat.color}-400 mb-2`}
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
          >
            {stat.value}
          </motion.p>
          <motion.p
            className="text-sm text-gray-400"
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
          >
            {stat.label}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const Benefits = () => {
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section ref={sectionRef} className="bg-black py-16 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, #2a0e61 0%, transparent 40%)",
            "radial-gradient(circle at 80% 80%, #610e2a 0%, transparent 40%)",
            "radial-gradient(circle at 20% 20%, #2a0e61 0%, transparent 40%)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text mb-4">
              Benefits of Pickleball
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover why pickleball is one of the fastest-growing sports, offering a perfect blend of physical activity, social interaction, and competitive fun.
            </p>
          </motion.div>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={index} />
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Benefits 