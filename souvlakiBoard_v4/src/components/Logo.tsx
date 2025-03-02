import { useState } from 'react';

const Logo = ({ logo, logoHover }: { logo: string; logoHover: string }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative w-12 h-12 m-0 p-0"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src={logo}
        alt="Logo"
        className={`absolute top-0 left-0 w-15 h-15 transition-opacity duration-500 ease-in-out ${
          hover ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <img
        src={logoHover}
        alt="Logo Hover"
        className={`absolute top-0 left-0 w-15 h-15 transition-opacity duration-500 ease-in-out ${
          hover ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default Logo;