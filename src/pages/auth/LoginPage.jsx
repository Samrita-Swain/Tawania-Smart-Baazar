import LoginForm from '../../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col text-center">
        <img
                  src="/logo-1.png"
                  alt="Twania Smart Bazaar"
                  className="h-16 w-auto object-contain"
                />
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Twania Smart Bazaar. All rights reserved by <br /><a href="https://www.wipstertechnologies.com/" className='pointer hover:text-[#9f7324]' target="_blank" >Wipster Technologies Private Limited</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
