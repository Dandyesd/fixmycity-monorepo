import React from "react";
import Button from "../../components/Button";
import { useAuth } from "../../contexts/AuthContexts"; // Import useAuth hook
import imgbuilding from "../../assets/building.svg";

import heroImage from "../../assets/city8.png";
import problem1Image from "../../assets/problem1.jpg";
import problem2Image from "../../assets/problem2.png";
import problem3Image from "../../assets/problem3.jpg";

const heroImageUrl = heroImage;
const beforeAfterImages = [
  { src: problem1Image, alt: "Problem img" },
  { src: problem2Image, alt: "Problem img" },
  { src: problem3Image, alt: "Problem img" },
];

const LandingPage = () => {
  // Use the auth context instead of props
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="bg-white text-gray-800 font-sans">
      <main>
        <div className="w-full h-80 md:h-[500px] bg-gray-300">
          <img
            src={heroImageUrl}
            alt="Cityscape"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-6 pt-12 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {beforeAfterImages.map((image, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-40 md:h-56 object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
            See It. Report It. Get It Fixed.
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-600 mb-8">
            Spotted a pothole, broken streetlight, or other public facility damage? Report local issues directly from our website and help build a better community, together.
          </p>

        {/* Conditionally render based on isLoggedIn */}
        {isLoggedIn ? (
          // Content when logged in
          <>
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Ready to create a new report?
            </h3>
            <div className="flex justify-center gap-4">
              {/* Button to create a report */}
              <Button
                title={"Make a Report"}
                condition={false}
                to={"/laporan"}
                className="px-50"
              />
            </div>
          </>
        ) : (
          // Content when NOT logged in
          <>
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Want to make a report? Log in first.
            </h3>
            <div className="flex justify-center gap-4">
              {/* Original Login button */}
              <Button
                title={"Login"}
                condition={false}
                to={"/login"}
                className="px-50"
              />
            </div>
          </>
        )}
      </div>
      </main>
    </div>
  );
};

export default LandingPage;