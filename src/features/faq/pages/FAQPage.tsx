import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    id: 1,
    question: "How do I enroll in a course?",
    answer: "To enroll in a course, browse our course catalog, select the course you're interested in, and click the 'Enroll' or 'Buy Now' button. If it's a free course, you'll get immediate access. For paid courses, you'll be directed to complete the payment process before gaining access."
  },
  {
    id: 2,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and in some regions, we offer additional local payment methods. All transactions are secure and encrypted."
  },
  {
    id: 3,
    question: "Can I access courses on mobile devices?",
    answer: "Yes, our platform is fully responsive and works on all devices. You can access your courses via web browsers on smartphones and tablets. We also have dedicated mobile apps for iOS and Android for a better learning experience on the go."
  },
  {
    id: 4,
    question: "Do courses have expiration dates?",
    answer: "Once you enroll in a course, you have lifetime access to the course materials. There are no expiration dates, and you can revisit the content as many times as you want. This allows you to learn at your own pace and review the material whenever needed."
  },
  {
    id: 5,
    question: "How do I get a certificate after completing a course?",
    answer: "Certificates are automatically generated when you complete all required components of a course (lectures, quizzes, assignments). You can download your certificate from your profile page under the 'Certificates' tab. Certificates can be shared on LinkedIn or added to your resume."
  },
  {
    id: 6,
    question: "What is your refund policy?",
    answer: "We offer a 30-day money-back guarantee for most courses. If you're unsatisfied with a course, you can request a refund within 30 days of purchase, provided you haven't completed more than 30% of the course content. Some specialized programs may have different refund policies, which will be clearly stated on their course pages."
  },
  {
    id: 7,
    question: "Can I download course videos for offline viewing?",
    answer: "Most courses allow you to download videos for offline viewing through our mobile apps. However, this feature may not be available for all courses due to instructor preferences or content licensing restrictions. The download option will be visible on the course page if available."
  },
  {
    id: 8,
    question: "How do I contact an instructor with questions?",
    answer: "Each course has a discussion forum where you can ask questions related to the course content. Instructors typically respond within 1-3 business days. For direct communication, some instructors also provide a messaging option on their profile page or specific contact instructions in the course introduction."
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState(faqs);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFaqs(filtered);
  };

  return (
    <div className="py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our platform, courses, payments, and more.
            If you can't find what you're looking for, feel free to contact our support team.
          </p>
          
          <form onSubmit={handleSearch} className="mt-8 max-w-md mx-auto relative">
            <Input
              type="text"
              placeholder="Search questions..."
              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-4 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Button 
              type="submit"
              className="absolute right-2 top-1.5 bg-primary text-white rounded-md px-3 py-1.5 text-sm"
            >
              Search
            </Button>
          </form>
        </div>
        
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                    <AccordionTrigger className="text-left font-medium py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pt-2 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No results found for "{searchQuery}"</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setFilteredFaqs(faqs);
                    }}
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </Accordion>
          </CardContent>
        </Card>
        
        <div className="mt-12 text-center">
          <h2 className="text-xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you with any other questions or concerns.
          </p>
          <Button className="bg-primary hover:bg-primary/90">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
