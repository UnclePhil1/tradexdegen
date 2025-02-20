import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";

const Navbar = () => {
  return (
    <div className="bg-secondary p-4 w-full h-full flex justify-between items-center">
      <Link to="/">
        <img src="/images/gen.svg" alt="logo" className="w-full h-full" />
      </Link>
      <div className="flex gap-4">
        {/* <Link
          to="/"
          className="py-2 px-6 rounded-md text-white flex items-center gap-2 font-thin cursor-pointer border border-primary/10 bg-primary/10 hover:bg-primary/20 hover:text-white/100 transition-all duration-300 shadow-md hover:shadow-primary/30"
        >
          Launch app
        </Link> */}

        <Dialog>
          <DialogTrigger>
            <button
              className={`py-2 px-6 rounded-md text-white flex items-center gap-2 font-thin cursor-pointer border border-primary/10 bg-primary/10 hover:bg-primary/20 hover:text-white/100 transition-all duration-300 shadow-md hover:shadow-primary/30`}
              data-aos="fade-up"
            >
              Cooking
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogDescription className="text-white">
                <p className="text-lg text-center">
                  Xdegen is cooking something spicy for you. I'm sure you can't
                  wait to taste it.
                </p>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Navbar;
