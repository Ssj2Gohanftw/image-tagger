import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import Image from "next/image";

interface GalleryImage {
  image: string;
  description: string;
}
export const GalleryCards = ({}) => {
  return (
    <>
      <Card className="w-full max-w-sm ">
        <CardHeader className="text-center">
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <p>Hello</p>
          </div>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </>
  );
};
