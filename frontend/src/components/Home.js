import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaSignInAlt,
  FaQuestionCircle,
  FaChartBar,
  FaHistory,
  FaUserEdit,
} from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const handleRoute = () => {
    if (authToken) return navigate("/dashboard");
    return navigate("/login");
  };

  const steps = [
    {
      name: "Login or Signup",
      description:
        "Get started by logging into your account or signing up as a new user.",
      icon: FaSignInAlt,
    },
    {
      name: "Take a Quiz",
      description:
        "Choose from a variety of quizzes and test your knowledge on different topics.",
      icon: FaQuestionCircle,
    },
    {
      name: "View Results",
      description:
        "Instantly get your quiz results and see how well you performed.",
      icon: FaChartBar,
    },
    {
      name: "Check Leaderboard",
      description:
        "See how you rank compared to others and strive for the top position.",
      icon: FaChartBar,
    },
    {
      name: "Review Your History",
      description:
        "Access all your previous quiz attempts and analyze your performance.",
      icon: FaHistory,
    },
    {
      name: "Update Profile",
      description:
        "Keep your profile up-to-date, including your password and profile picture.",
      icon: FaUserEdit,
    },
  ];

  return (
    <main className="flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-white to-indigo-600">
      <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
        <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Welcome to Quiz-EZ
            </h2>
            <p className="mt-2 text-3xl sm:text-6xl font-bold tracking-tight text-gray-900">
              Your Ultimate Quiz Companion
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Challenge yourself with our interactive quizzes, track your
              progress, and climb the leaderboard. Quiz-EZ makes learning fun
              and engaging.
            </p>
          </div>
          <button
            onClick={() => handleRoute()}
            className="bg-indigo-600 text-white mt-4 py-2 px-6 rounded-md hover:bg-indigo-700"
          >
            Get Started
          </button>
        </div>
        <div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <img
              alt="App Screenshot"
              src="https://res.cloudinary.com/dqela8lj8/image/upload/v1732818027/pi9ezepogjyesmexbcoq.webp"
              width={2432}
              height={1442}
              className="mb-[0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            />
            <div className="relative" aria-hidden="true">
              <div className="absolute bottom-0 -inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]" />
            </div>
          </div>
        </div>
        {/* Steps Section */}
        <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {steps.map((step) => (
              <div key={step.name} className="relative pl-9">
                <dt className=" font-semibold text-gray-900 flex items-center">
                  <step.icon
                    aria-hidden="true"
                    className="absolute left-1 top-1 h-6 w-6 text-indigo-600"
                  />
                  <span className="ml-8">{step.name}</span>
                </dt>
                <dd className="mt-2 ml-8 text-gray-600">{step.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </main>
  );
};

export default Home;
