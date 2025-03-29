import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Card, CardContent } from "./ui/card"
import { FolderIcon, Settings, Flashlight } from "lucide-react"

const guides = [
  {
    title: "Equipment Guide",
    icon: FolderIcon,
    color: "purple",
    items: [
      "Paddle selection tips",
      "Ball specifications",
      "Court equipment"
    ],
    href: "/equipment"
  },
  {
    title: "Rules & Scoring",
    icon: Settings,
    color: "pink",
    items: [
      "Basic rules overview",
      "Scoring system",
      "Court layout"
    ],
    href: "/rules"
  },
  {
    title: "Basic Techniques",
    icon: Flashlight,
    color: "blue",
    items: [
      "Serving techniques",
      "Basic shots",
      "Court positioning"
    ],
    href: "/techniques"
  }
]

const GuideCard = ({ guide, index }: { guide: typeof guides[0], index: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  const Icon = guide.icon
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="h-full"
    >
      <Card className="bg-[#1E1E1E] text-gray-300 h-full border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20">
        <CardContent className="p-6">
          <motion.div 
            className={`flex items-center justify-center text-4xl text-${guide.color}-500 mb-6`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
          >
            <Icon className="w-12 h-12" />
          </motion.div>
          
          <motion.h3 
            className={`text-xl font-bold text-${guide.color}-400 mb-4 text-center`}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: index * 0.2 + 0.4 }}
          >
            {guide.title}
          </motion.h3>
          
          <motion.ul 
            className="text-left space-y-2 text-sm min-h-[100px]"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.2 + 0.5 }}
          >
            {guide.items.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: index * 0.2 + 0.6 + (i * 0.1) }}
                className="flex items-center"
              >
                <span className={`text-${guide.color}-400 mr-2`}>✓</span>
                {item}
              </motion.li>
            ))}
          </motion.ul>
          
          <motion.a
            href={guide.href}
            className={`text-${guide.color}-400 mt-6 inline-block hover:underline text-sm group flex items-center`}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: index * 0.2 + 0.9 }}
            whileHover={{ x: 5 }}
          >
            Learn more 
            <motion.span
              initial={{ x: 0 }}
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </motion.a>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const GetStarted = () => {
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section ref={sectionRef} className="bg-black py-16 relative overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, #2a0e61 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, #2a0e61 0%, transparent 50%)",
            "radial-gradient(circle at 0% 0%, #2a0e61 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-pink-500 mb-6">
            Getting Started with Pickleball
          </h2>
          <motion.div
            className="border-b-2 border-pink-500 w-24 mx-auto"
            initial={{ width: 0 }}
            animate={sectionInView ? { width: 96 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          {guides.map((guide, index) => (
            <GuideCard key={guide.title} guide={guide} index={index} />
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <motion.a
            href="/courts"
            className="inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white text-lg px-8 py-3 rounded-full shadow-lg transform transition hover:scale-105 hover:shadow-2xl relative overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <span className="relative">
              Start Your Journey →
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default GetStarted 