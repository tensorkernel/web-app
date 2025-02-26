import { motion } from 'framer-motion';

export function PrivacyPolicyPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-8 bg-gray-800 rounded-2xl shadow-xl"
    >
      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
      <p className="text-gray-300 mb-4">
        This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from GamePortal (the “Site”).
      </p>
      <h2 className="text-2xl font-bold text-white mb-4">Personal Information We Collect</h2>
      <p className="text-gray-300 mb-4">
        When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site. We refer to this automatically-collected information as “Device Information.”
      </p>
      <h2 className="text-2xl font-bold text-white mb-4">How Do We Use Your Personal Information?</h2>
      <p className="text-gray-300 mb-4">
        We use the Device Information that we collect to help us screen for potential risk and fraud (in particular, your IP address), and more generally to improve and optimize our Site (for example, by generating analytics about how our customers browse and interact with the Site, and to assess the success of our marketing and advertising campaigns).
      </p>
      <h2 className="text-2xl font-bold text-white mb-4">Sharing Your Personal Information</h2>
      <p className="text-gray-300 mb-4">
        We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Shopify to power our online store--you can read more about how Shopify uses your Personal Information here: https://www.shopify.com/legal/privacy. We also use Google Analytics to help us understand how our customers use the Site--you can read more about how Google uses your Personal Information here: https://www.google.com/intl/en/policies/privacy/. You can also opt-out of Google Analytics here: https://tools.google.com/dlpage/gaoptout.
      </p>
      <h2 className="text-2xl font-bold text-white mb-4">Do Not Track</h2>
      <p className="text-gray-300 mb-4">
        Please note that we do not alter our Site’s data collection and use practices when we see a Do Not Track signal from your browser.
      </p>
      <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
      <p className="text-gray-300 mb-4">
        If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
      </p>
      <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
      <p className="text-gray-300 mb-4">
        When you place an order through the Site, we will retain your Personal Information for our records unless and until you ask us to delete this information.
      </p>
      <h2 className="text-2xl font-bold text-white mb-4">Changes</h2>
      <p className="text-gray-300 mb-4">
        We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
      </p>
      <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
      <p className="text-gray-300 mb-4">
        For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at contact@gameportal.com or by mail using the details provided below:
      </p>
      <p className="text-gray-300 mb-4">
        GamePortal<br />
        1234 Street Address<br />
        City, State, ZIP<br />
        Country
      </p>
    </motion.div>
  );
}
