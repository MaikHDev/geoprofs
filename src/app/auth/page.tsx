"use server";

import SignInPage from "~/app/auth/signIn";
import {HydrateClient} from "~/trpc/server";

export default async function AuthPage() {

    return (
        <HydrateClient>
            <SignInPage/>
        </HydrateClient>
    );
}
