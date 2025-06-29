import { z } from 'zod';
import { router, publicProcedure } from '../server';
import { createHash } from 'crypto';

const emailSuffixSha = process.env.EMAIL_SUFFIX_SHA;

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ email: z.string().min(1)}))
    .mutation(({ input }) => {
        const split = input.email.split("@");
        if (split.length !== 2) {
            return {
                success: false,
                message: "Invalid email",
            }
        }
        const [username, domain] = split;
        const emailSuffix = createHash('sha256').update(domain).digest('hex');
        if (emailSuffix !== emailSuffixSha) {
            return {
                success: false,
                message: "Invalid email",
            }
        }
        return {
            success: true,
            message: "Login successful",
        }
    }),
}); 