const Footer = () => {
  return (
    <footer className="flex  justify-center items-center w-full text-black px-4 mt-10  ">
      <div className="w-[100%] bg-white md:w-[80%] shadow-lg text-center p-8 rounded-2xl ">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Quiz-EZ. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
