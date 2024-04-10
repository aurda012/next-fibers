"use client";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Textarea } from "../ui/textarea";
import { useUploadThing } from "@/lib/uploadthing";

// import { updateUser } from "@/lib/actions/user.actions";
import { FiberValidation } from "@/lib/validations/fiber";
import { createFiber } from "@/lib/actions/fiber.actions";

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

const PostFiber = ({ userId }: { userId: string }) => {
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FiberValidation),
    defaultValues: {
      fiber: "",
      accountId: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof FiberValidation>) => {
    await createFiber({
      text: values.fiber,
      author: userId,
      communityId: null,
      path: pathname,
    });

    router.push("/");
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="fiber"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500">
          Post Fiber
        </Button>
      </form>
    </Form>
  );
};

export default PostFiber;
