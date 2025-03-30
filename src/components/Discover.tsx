import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Card } from "./ui/card"
import { Ruler, ArrowDown, Trophy, Activity, Users, BookOpen, Heart } from "lucide-react"

const getIconComponent = (iconName: string) => {
  const icons = {
    'ruler': Ruler,
    'arrow-down': ArrowDown,
    'trophy': Trophy,
    'activity': Activity,
    'users': Users,
    'book-open': BookOpen,
    'heart': Heart
  }
  return icons[iconName as keyof typeof icons] || Activity
}

const features = [
  {
    title: "What is Pickleball?",
    description: "Pickleball is a dynamic paddleball sport that perfectly blends elements of tennis, badminton, and table tennis. Played on a compact court with a lower net, it offers an accessible yet exciting experience for players of all skill levels.",
    points: [
      { text: "Smaller court size (20' x 44')", icon: "ruler", color: "pink" },
      { text: "Lower net height (34 inches)", icon: "arrow-down", color: "purple" },
      { text: "Unique scoring system", icon: "trophy", color: "blue" }
    ]
  },
  {
    title: "Why Choose Pickleball?",
    description: "Perfect for all ages and skill levels, pickleball offers a unique blend of exercise, social interaction, and competitive fun.",
    items: [
      { title: "Active Lifestyle", icon: "activity", description: "Great cardio workout for all fitness levels" },
      { title: "Social Sport", icon: "users", description: "Build friendships and community" },
      { title: "Easy to Learn", icon: "book-open", description: "Quick learning curve for beginners" },
      { title: "All Ages", icon: "heart", description: "Perfect for families and seniors" }
    ]
  }
]

const FeaturePoint = ({ text, icon, color }: { text: string; icon: string; color: string }) => {
  const IconComponent = getIconComponent(icon)
  return (
    <motion.li 
      className="flex items-center text-gray-300 group"
      whileHover={{ x: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div 
        className={`w-8 h-8 bg-${color}-400/20 rounded-full mr-4 flex items-center justify-center`}
        whileHover={{ scale: 1.1 }}
      >
        <IconComponent className={`w-4 h-4 text-${color}-400`} />
      </motion.div>
      {text}
    </motion.li>
  )
}

const FeatureGrid = ({ items }: { items: typeof features[1]['items'] }) => {
  if (!items) return null
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {items.map((item, i) => {
        const IconComponent = getIconComponent(item.icon)
        return (
          <motion.div
            key={item.title}
            className="flex flex-col items-center bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <IconComponent className="w-8 h-8 text-pink-400 mb-2" />
            <h3 className="text-lg font-bold text-gray-200">{item.title}</h3>
            <p className="text-sm text-gray-400 text-center">{item.description}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

const Discover = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section ref={ref} className="py-12 bg-[#121212] relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: "100% 50%" }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{
          background: "linear-gradient(45deg, #2a0e61, #1a1a1a, #611e0e)",
          backgroundSize: "400% 400%"
        }}
      />

      <div className="max-w-6xl mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
            Discover Pickleball
          </span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="bg-gray-900/50 backdrop-blur border-gray-800 p-6 h-full">
                <h3 className="text-2xl font-bold text-pink-400 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-6">
                  {feature.description}
                </p>
                {'points' in feature && feature.points ? (
                  <ul className="space-y-4">
                    {feature.points.map((point) => (
                      <FeaturePoint key={point.text} {...point} />
                    ))}
                  </ul>
                ) : (
                  <FeatureGrid items={feature.items} />
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Discover 