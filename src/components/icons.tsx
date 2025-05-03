import {LucideProps, Loader2, Chrome} from "lucide-react";

export const Icons = {
  spinner: (props: LucideProps) => <Loader2 {...props} />,
  google: (props: LucideProps) => <Chrome {...props} />,
};
