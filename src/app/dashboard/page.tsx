import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const tests = await prisma.test.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.name || user.email}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Past Results</CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <p>No tests taken yet. <Link href="/test" className="text-primary underline">Start a new test</Link></p>
          ) : (
            <div className="space-y-6">
              {tests.map((test) => (
                <div key={test.id} className="border p-6 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xl font-bold">{test.score}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.category} • {new Date(test.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/results?score=${test.score}&percentile=${test.percentile}&category=${test.category}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
