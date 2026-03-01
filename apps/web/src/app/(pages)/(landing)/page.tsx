import Image from "next/image";
import LoginButton from "~/app/_components/auth/login-button";

const textOptions = [
  "Insights on interviews, pay, and job experience",
  "Side-by-side comparison view of up to three jobs",
  "Anonymous reviews to protect identities",
];
export default function Landing() {
  return (
    <div className="flex w-full flex-col lg:flex-row bg-[#FFFEF6] overflow-auto lg:overflow-hidden h-full flex-1">
      <div className="lg:w-[43%] flex flex-col pl-16 pr-28 justify-center pt-2 lg:pt-0">
        <div className="flex flex-row items-center gap-2">
          <div className="text-cooper-blue-800 text-[40px] leading-[48px] font-semibold">
            Real reviews of{" "}
            <p className="font-black italic p-0">real co-op experiences</p>
          </div>
          <div>
            <Image
              src="/blue-star.png"
              width={30}
              height={32}
              alt="Blue star"
            />
          </div>
        </div>
        <div className="w-full pt-8">
          <LoginButton />
          <div className="text-cooper-gray-600 font-bold text-md pb-8 pt-4">
            Only Northeastern students can access reviews
          </div>
          <hr />
        </div>

        <div className="pt-6 text-cooper-gray-550 font-lg flex flex-col gap-3">
          {textOptions.map((option) => {
            return (
              <div className="flex flex-row gap-2">
                <Image
                  src="/svg/blueCheck.svg"
                  width={11}
                  height={9}
                  alt="Blue check"
                />
                <div>{option}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <Image
          src="/landing-placeholder.png"
          width={880}
          height={600}
          alt="Landing picture"
          className="pt-20"
        />
      </div>
    </div>
  );
}
