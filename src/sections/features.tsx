"use client"

import { motion } from "framer-motion"
import { Brain, Target, Zap, BarChart3, Shield, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Brain,
    title: "Logical Reasoning",
    description: "Test your ability to analyze patterns, solve problems, and draw logical conclusions from complex information.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Pattern Recognition",
    description: "Discover how quickly you can identify visual and numerical patterns, a key indicator of cognitive flexibility.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Numerical Ability",
    description: "Assess your mathematical reasoning, quantitative analysis, and ability to work with numbers efficiently.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Receive comprehensive insights into your cognitive strengths with personalized breakdowns and recommendations.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data is encrypted and secure. We never share your personal information with third parties.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Clock,
    title: "Quick & Accurate",
    description: "Complete the assessment in just 15-20 minutes and get instant results with detailed explanations.",
    color: "from-yellow-500 to-orange-500",
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

export function Features() {
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What You&apos;ll <span className="gradient-text">Discover</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive assessment evaluates multiple dimensions of cognitive ability, 
            giving you a complete picture of your mental strengths.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full card-hover border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
