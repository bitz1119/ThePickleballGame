import { motion } from "framer-motion"
import { Button } from "./ui/button"

const Hero = () => {
  return (
    <section className="max-w-6xl mx-auto py-20 flex flex-col md:flex-row items-center px-4">
      {/* Text Content */}
      <motion.div 
        className="text-center md:text-left md:w-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="text-5xl font-extrabold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text animate-gradient">
            Master the Game of Pickleball
          </span>
        </motion.h1>
        
        <motion.p 
          className="mt-4 text-lg text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Join the fastest-growing sport in America. Learn, play, and excel with our comprehensive guide to pickleball.
        </motion.p>

        <motion.div 
          className="mt-8 flex justify-center md:justify-start space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Button variant="gradient" size="lg" asChild>
            <a href="/get-started">Get Started</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/blog">Learn More</a>
          </Button>
        </motion.div>
      </motion.div>

      {/* Image Content */}
      <motion.div 
        className="mt-10 md:mt-0 md:w-1/2 flex justify-center"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <motion.img
          src="/demopickleball.jpg"
          alt="Pickleball Game"
          className="rounded-lg shadow-2xl"
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.3 }
          }}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </section>
  )
}

export default Hero 