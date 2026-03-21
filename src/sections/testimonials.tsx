"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Software Engineer",
    avatar: "SM",
    content: "I was amazed by the accuracy of the results. The detailed breakdown helped me understand my cognitive strengths and areas where I can improve. Highly recommended!",
    rating: 5,
    score: 128,
  },
  {
    name: "James Chen",
    role: "Medical Student",
    avatar: "JC",
    content: "As someone who values scientific rigor, I appreciate how this test is designed. The questions are challenging but fair, and the insights were genuinely useful.",
    rating: 5,
    score: 135,
  },
  {
    name: "Emily Rodriguez",
    role: "Data Analyst",
    avatar: "ER",
    content: "The pattern recognition section was particularly eye-opening. I've since been working on improving my speed, and I can already see the difference in my daily work.",
    rating: 5,
    score: 122,
  },
  {
    name: "Michael Park",
    role: "Product Manager",
    avatar: "MP",
    content: "Took this test with my team as a team-building exercise. The discussions afterward about different cognitive styles were incredibly valuable.",
    rating: 5,
    score: 118,
  },
  {
    name: "Lisa Thompson",
    role: "Research Scientist",
    avatar: "LT",
    content: "The premium report was worth every penny. Beautifully designed and packed with actionable insights. I've recommended it to all my colleagues.",
    rating: 5,
    score: 142,
  },
  {
    name: "David Kim",
    role: "Finance Analyst",
    avatar: "DK",
    content: "Quick, engaging, and surprisingly accurate. The numerical reasoning section really pushed me to think faster. Great experience overall!",
    rating: 5,
    score: 125,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            <Star className="w-4 h-4 mr-1 fill-current" />
            4.9/5 Average Rating
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="gradient-text">Users Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join over a million people who have discovered their cognitive potential
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={testimonial.name} variants={itemVariants}>
              <Card className="h-full card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{testimonial.rating}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-6 h-6 text-primary/20" />
                    <p className="text-muted-foreground pl-4">
                      {testimonial.content}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Cognitive Score</span>
                      <Badge variant="outline" className="font-mono">
                        {testimonial.score}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
