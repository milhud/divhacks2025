"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PricingTier {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: string[]
  popular?: boolean
  cta: string
  color: string
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const pricingTiers: PricingTier[] = [
    {
      id: 'individual',
      name: 'Individual',
      description: 'Perfect for personal fitness and basic rehabilitation',
      price: {
        monthly: 29,
        yearly: 290
      },
      features: [
        'Live camera feed analysis',
        'Basic AI form critique',
        'Pain level tracking',
        'Exercise library (100+ exercises)',
        'Progress tracking',
        'Video upload for analysis',
        'Basic workout plans',
        'Email support'
      ],
      cta: 'Start Free Trial',
      color: 'blue'
    },
    {
      id: 'patient',
      name: 'Patient',
      description: 'Designed for patients in rehabilitation programs',
      price: {
        monthly: 49,
        yearly: 490
      },
      features: [
        'Everything in Individual',
        'Advanced pain assessment',
        'Movement compensation detection',
        'Therapeutic exercise library (500+ exercises)',
        'Provider communication',
        'Treatment plan access',
        'Progress reports for providers',
        'Priority support',
        'Wearable device integration'
      ],
      cta: 'Start Free Trial',
      color: 'green'
    },
    {
      id: 'provider',
      name: 'Provider',
      description: 'For physical therapists and healthcare providers',
      price: {
        monthly: 199,
        yearly: 1990
      },
      features: [
        'Everything in Patient',
        'Patient management dashboard',
        'Exercise prescription system',
        'Live patient monitoring',
        'Clinical progress reports',
        'HIPAA compliance',
        'EHR integration',
        'Up to 50 patients',
        'Priority support',
        'Custom exercise creation',
        'Outcome analytics'
      ],
      popular: true,
      cta: 'Start Free Trial',
      color: 'purple'
    },
    {
      id: 'clinic',
      name: 'Clinic',
      description: 'For rehabilitation clinics and healthcare facilities',
      price: {
        monthly: 499,
        yearly: 4990
      },
      features: [
        'Everything in Provider',
        'Multi-therapist support',
        'Unlimited patients',
        'Advanced analytics dashboard',
        'Custom branding',
        'API access',
        'White-label options',
        'Dedicated account manager',
        'Custom integrations',
        'Training and onboarding',
        '24/7 phone support'
      ],
      cta: 'Contact Sales',
      color: 'orange'
    }
  ]

  const enterpriseFeatures = [
    'Custom pricing based on needs',
    'Dedicated infrastructure',
    'Custom AI model training',
    'Advanced security features',
    'Compliance consulting',
    'Custom development',
    'SLA guarantees',
    'Dedicated support team'
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      green: 'border-green-200 bg-green-50 text-green-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700',
      orange: 'border-orange-200 bg-orange-50 text-orange-700'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getButtonClasses = (color: string, popular?: boolean) => {
    const baseClasses = 'w-full font-medium transition-colors'
    if (popular) {
      return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`
    }
    
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700 text-white',
      green: 'bg-green-600 hover:bg-green-700 text-white',
      purple: 'bg-purple-600 hover:bg-purple-700 text-white',
      orange: 'bg-orange-600 hover:bg-orange-700 text-white'
    }
    return `${baseClasses} ${colors[color as keyof typeof colors] || colors.blue}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">V</span>
            </div>
            <h1 className="text-2xl font-bold text-balance">
              Vibe <span className="text-primary">Coach</span>
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Back to Home
            </Link>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Choose Your <span className="text-blue-600">Perfect Plan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            From individual fitness enthusiasts to large rehabilitation clinics, 
            we have the right plan for your needs. Start with a free trial and 
            upgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="text-sm text-green-600 font-medium">Save 20%</span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative p-8 ${
                tier.popular 
                  ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                  : 'shadow-md hover:shadow-lg transition-shadow'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    ${billingCycle === 'yearly' ? tier.price.yearly : tier.price.monthly}
                  </span>
                  <span className="text-gray-600 ml-1">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>

                {billingCycle === 'yearly' && (
                  <div className="text-sm text-green-600 font-medium mb-4">
                    Save ${(tier.price.monthly * 12) - tier.price.yearly} per year
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={getButtonClasses(tier.color, tier.popular)}
                size="lg"
              >
                {tier.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* Enterprise Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Enterprise Solutions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Need something custom? We work with large healthcare systems, 
              insurance companies, and enterprise clients to create tailored solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Enterprise Features</h3>
              <ul className="space-y-3">
                {enterpriseFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Get Started</h4>
              <p className="text-gray-600 mb-6">
                Contact our enterprise team to discuss your specific needs and 
                get a custom quote.
              </p>
              <div className="space-y-3">
                <Button size="lg" className="w-full">
                  Contact Enterprise Sales
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect 
                immediately, and we'll prorate any billing differences.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                All plans come with a 14-day free trial. No credit card required to start, 
                and you can cancel anytime during the trial period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What about HIPAA compliance?</h3>
              <p className="text-gray-600">
                Our Provider and Clinic plans are fully HIPAA compliant with BAA agreements 
                available. We use enterprise-grade security and encryption.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer discounts?</h3>
              <p className="text-gray-600">
                Yes! We offer 20% off annual plans, student discounts, and special pricing 
                for non-profit organizations. Contact us for details.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already improving their fitness and recovery 
            with Vibe Coach's AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
