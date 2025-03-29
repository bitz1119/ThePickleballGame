import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Card, CardContent } from "./ui/card"
import { Play, Calendar, MapPin, Users, ChevronRight } from "lucide-react"

const relatedVideos = [
  {
    title: "Beginner's Guide to Serves",
    duration: "4:32",
    views: "12K",
    thumbnail: "https://i.ytimg.com/vi/zVGLtDlZQt0/maxresdefault.jpg"
  },
  {
    title: "Advanced Dinking Strategy",
    duration: "6:15",
    views: "8.5K",
    thumbnail: "https://i.ytimg.com/vi/zVGLtDlZQt0/maxresdefault.jpg"
  },
  {
    title: "Tournament Preparation Tips",
    duration: "5:45",
    views: "15K",
    thumbnail: "https://i.ytimg.com/vi/zVGLtDlZQt0/maxresdefault.jpg"
  }
]

const events = [
  {
    title: "Tampa Open Championship",
    date: "June 15-17, 2024",
    location: "Tampa, FL",
    participants: "200+"
  },
  {
    title: "Summer Pickleball Series",
    date: "July 8-10, 2024",
    location: "Tampa, FL",
    participants: "150+"
  }
]

const RelatedVideoCard = ({ video, index }: { video: typeof relatedVideos[0], index: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-lg mb-2">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-32 object-cover transform group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Play className="w-12 h-12 text-white" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-200 group-hover:text-pink-400 transition-colors duration-300">
        {video.title}
      </h3>
      <p className="text-xs text-gray-400">{video.views} views</p>
    </motion.div>
  )
}

const EventCard = ({ event, index }: { event: typeof events[0], index: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="bg-[#1E1E1E]/50 backdrop-blur-sm border-gray-800 hover:border-gray-700 transition-all duration-300">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-pink-400 mb-2">{event.title}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-300">
              <Calendar className="w-4 h-4 mr-2 text-pink-400" />
              {event.date}
            </div>
            <div className="flex items-center text-gray-300">
              <MapPin className="w-4 h-4 mr-2 text-purple-400" />
              {event.location}
            </div>
            <div className="flex items-center text-gray-300">
              <Users className="w-4 h-4 mr-2 text-blue-400" />
              {event.participants} participants
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const VideoSection = () => {
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-b from-gray-900 to-black px-6 py-16 text-white">
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, #2a0e61 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, #2a0e61 0%, transparent 50%)",
            "radial-gradient(circle at 0% 0%, #2a0e61 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Video Content */}
          <motion.div
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: -20 }}
            animate={sectionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Experience Pickleball in Tampa
            </motion.h2>
            
            <motion.p
              className="text-gray-300 text-lg mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Join our vibrant community and discover why Tampa is becoming the ultimate pickleball destination. Experience year-round play, state-of-the-art facilities, and a welcoming atmosphere for players of all levels.
            </motion.p>

            <motion.div
              className="relative rounded-lg overflow-hidden border-4 border-pink-500 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={sectionInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <iframe
                src="https://www.youtube.com/embed/zVGLtDlZQt0"
                title="Pickleball Highlights"
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>

            <motion.div
              className="mt-8 grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {relatedVideos.map((video, index) => (
                <RelatedVideoCard key={video.title} video={video} index={index} />
              ))}
            </motion.div>
          </motion.div>

          {/* Sidebar Content */}
          <motion.div
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={sectionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-[#1E1E1E]/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <h3 className="text-2xl font-bold text-pink-400 mb-6">Upcoming Events</h3>
              <div className="space-y-4">
                {events.map((event, index) => (
                  <EventCard key={event.title} event={event} index={index} />
                ))}
              </div>

              <motion.a
                href="/events"
                className="mt-6 inline-flex items-center text-pink-400 hover:text-pink-300 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                View all events
                <ChevronRight className="w-4 h-4 ml-1" />
              </motion.a>
            </div>

            <motion.div
              className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Join Our Community</h3>
              <p className="text-gray-300 mb-6">
                Stay updated with the latest events, tournaments, and pickleball news in Tampa.
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 rounded-lg bg-black/50 border border-gray-700 text-white mb-4 focus:outline-none focus:border-pink-500"
              />
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                Subscribe Now
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default VideoSection 