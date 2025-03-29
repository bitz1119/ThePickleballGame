import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Card, CardContent } from "./ui/card"
import { Swords, Shield, BookOpen, Target, Footprints, Users2, Brain, Zap } from "lucide-react"

const techniques = [
  {
    title: "Serving Techniques",
    icon: Swords,
    color: "pink",
    description: "Master the fundamental serves",
    items: [
      "Underhand serve below waist level",
      "Contact point in front of body",
      "Aim for deep placement",
      "Consistent toss height"
    ]
  },
  {
    title: "Basic Shots",
    icon: Shield,
    color: "purple",
    description: "Essential shots every player needs",
    items: [
      "Dink shots - soft and controlled",
      "Volley - hit ball in air",
      "Ground strokes with control",
      "Drop shots and lobs"
    ]
  },
  {
    title: "Strategy Tips",
    icon: Brain,
    color: "blue",
    description: "Smart gameplay decisions",
    items: [
      "Stay at non-volley zone line",
      "Communication with partner",
      "Patient shot selection",
      "Court positioning"
    ]
  }
]

const advancedTips = [
  {
    title: "Shot Selection",
    icon: Target,
    description: "Choose high-percentage shots over risky plays",
    color: "amber"
  },
  {
    title: "Footwork",
    icon: Footprints,
    description: "Quick, small steps for better control",
    color: "emerald"
  },
  {
    title: "Partner Play",
    icon: Users2,
    description: "Effective communication and court coverage",
    color: "indigo"
  }
]

const TechniqueCard = ({ technique, index }: { technique: typeof techniques[0], index: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  const Icon = technique.icon
  
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
            <div className={`p-2 rounded-lg bg-${technique.color}-500/10 group-hover:bg-${technique.color}-500/20 transition-colors duration-300`}>
              <Icon className={`w-6 h-6 text-${technique.color}-400`} />
            </div>
            <h3 className={`text-xl font-bold text-${technique.color}-400`}>
              {technique.title}
            </h3>
          </motion.div>
          
          <motion.p
            className="text-gray-400 text-sm mb-4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.2 + 0.4 }}
          >
            {technique.description}
          </motion.p>
          
          <motion.ul 
            className="space-y-2 text-sm"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.2 + 0.5 }}
          >
            {technique.items.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: index * 0.2 + 0.6 + (i * 0.1) }}
                className="flex items-center text-gray-300"
              >
                <Zap className={`w-4 h-4 mr-2 text-${technique.color}-400 flex-shrink-0`} />
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const AdvancedTipCard = ({ tip, index }: { tip: typeof advancedTips[0], index: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  const Icon = tip.icon

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
            className={`mx-auto w-12 h-12 rounded-full bg-${tip.color}-500/10 flex items-center justify-center mb-4`}
          >
            <Icon className={`w-6 h-6 text-${tip.color}-400`} />
          </motion.div>
          <motion.h3
            className={`text-xl font-bold text-${tip.color}-400 mb-2`}
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
          >
            {tip.title}
          </motion.h3>
          <motion.p
            className="text-sm text-gray-400"
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
          >
            {tip.description}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const Techniques = () => {
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
              Basic Techniques & Strategies
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Master the fundamental techniques and strategies that will elevate your pickleball game to the next level.
            </p>
          </motion.div>
        </motion.div>

        {/* Techniques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {techniques.map((technique, index) => (
            <TechniqueCard key={technique.title} technique={technique} index={index} />
          ))}
        </div>

        {/* Advanced Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {advancedTips.map((tip, index) => (
            <AdvancedTipCard key={tip.title} tip={tip} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Techniques 