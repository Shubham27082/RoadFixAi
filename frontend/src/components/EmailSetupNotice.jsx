import { AlertCircle, Mail, Settings } from 'lucide-react';

const EmailSetupNotice = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <AlertCircle style={{ width: '20px', height: '20px', color: '#d97706', marginTop: '2px' }} />
        <div className="text-sm">
          <p className="font-medium text-yellow-800 mb-1">
            Email Service Setup Required
          </p>
          <p className="text-yellow-700 mb-3">
            To receive verification codes via email, the administrator needs to configure the email service in the backend.
          </p>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <p className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
              <Settings style={{ width: '16px', height: '16px' }} />
              For Administrators:
            </p>
            <ol className="text-yellow-700 text-xs space-y-1 ml-4">
              <li>1. Set up Gmail App Password or SMTP credentials</li>
              <li>2. Update the backend .env file with email settings</li>
              <li>3. Run <code className="bg-yellow-200 px-1 rounded">node test-email.js</code> to test</li>
              <li>4. Restart the backend server</li>
            </ol>
            <p className="text-yellow-700 text-xs mt-2">
              📖 See <code>email-setup-guide.md</code> for detailed instructions
            </p>
          </div>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium text-blue-800 mb-1 flex items-center gap-2">
              <Mail style={{ width: '16px', height: '16px' }} />
              For Testing:
            </p>
            <p className="text-blue-700 text-xs">
              Once email is configured, verification codes will be sent to your actual email address during registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSetupNotice;