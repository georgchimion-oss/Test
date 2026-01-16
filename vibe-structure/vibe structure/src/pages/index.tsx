import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useGeorgTownList } from "@/generated/hooks/useGeorgTown";
import { type GeorgTown } from "@/generated/models/georg-town-model";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [userName, setUserName] = useState<string | undefined>(undefined);

  // Fetch towns
  const { data: towns, isLoading, isFetching, isError, error, refetch } = useGeorgTownList({
    orderBy: ["townName asc"],
  });

  // Attempt to resolve authenticated user's display name from common SSO providers/globals
  useEffect(() => {
    try {
      const w = window as unknown as {
        Microsoft?: { Teams?: { user?: { displayName?: string } } };
        PowerApps?: { context?: { user?: { displayName?: string; email?: string } } };
        office?: { context?: { mailbox?: { userProfile?: { displayName?: string } } } };
        msal?: { getAllAccounts?: () => Array<{ name?: string; username?: string; localAccountId?: string }> };
      };
      const candidates: (string | undefined)[] = [
        w?.PowerApps?.context?.user?.displayName,
        w?.Microsoft?.Teams?.user?.displayName,
        w?.office?.context?.mailbox?.userProfile?.displayName,
        w?.msal?.getAllAccounts ? w.msal.getAllAccounts()[0]?.name : undefined,
      ].filter(Boolean);
      if (candidates.length > 0) {
        setUserName(candidates[0]);
      }
    } catch {
      // Safe no-op fallback; keep name undefined
    }
  }, []);

  const loading = isLoading || isFetching;

  // Helper to render a single town row
  const renderTown = (town: GeorgTown) => {
    const country = town.country?.trim() ?? "";
    const state = town.state?.trim() ?? "";
    const hasLocation = Boolean(country || state);
    const population =
      typeof town.population === "number" && Number.isFinite(town.population)
        ? town.population.toLocaleString()
        : undefined;

    return (
      <Item key={town.id} className="rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors p-4">
        <ItemMedia>
          {hasLocation ? (
            <Badge variant="secondary">
              {state && country ? `${state}, ${country}` : state || country}
            </Badge>
          ) : (
            <Badge variant="outline">Location</Badge>
          )}
        </ItemMedia>
        <ItemContent>
          <ItemHeader>
            <ItemTitle className="text-foreground">{town.townName}</ItemTitle>
            <ItemDescription className="text-muted-foreground">
              {population ? <>Population: {population}</> : <>Population data unavailable</>}
            </ItemDescription>
          </ItemHeader>
        </ItemContent>
        <ItemActions />
      </Item>
    );
  };

  return (
    <div className="w-full">
      <section className="w-full py-10 px-6 sm:px-10 lg:px-12">
        <div className="w-full grid gap-8">
          <div className="w-full">
            <div className="w-full rounded-xl border border-border overflow-hidden bg-card">
              <div className="w-full">
                <img
                  src="https://cdn.hubblecontent.osi.office.net/m365content/publish/b51ac394-a98b-487b-881a-48497b592ab3/thumbnails/xxlarge.jpg"
                  data-keyword="team meeting"
                  alt="People collaborating in a team meeting"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://res-dev.cdn.officeppe.net/m365content/publish/2726fcef-98f3-490e-a297-f75d644ff043/thumbnails/xxlarge.jpg";
                  }}
                  className="h-48 w-full object-cover"
                />
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-lg sm:text-xl text-muted-foreground">Welcome{userName ? "," : ""} <span className="font-semibold text-foreground">{userName ?? ""}</span></p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse towns from the GeorgTown database below.
                </p>
              </div>
            </div>
          </div>

          <Card className="w-full bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground">Towns</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="w-full flex gap-3 items-center text-muted-foreground">
                  <Spinner />
                  <span>Loading towns...</span>
                </div>
              ) : isError ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      {error instanceof Error ? error.message : "Failed to load towns. Please try again."}
                    </AlertDescription>
                  </Alert>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className={cn(
                      "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium",
                      "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    )}
                  >
                    Retry
                  </button>
                </div>
              ) : towns && towns.length > 0 ? (
                <div className="w-full flex flex-col gap-3">
                  {towns.map(renderTown)}
                </div>
              ) : (
                <div className="w-full rounded-lg border border-border p-8 bg-background">
                  <div className="flex flex-col gap-4">
                    <div className="w-full">
                      <img
                        src="https://cdn.hubblecontent.osi.office.net/m365content/publish/e7be9c85-87db-4312-b42f-1b4bb31c33c8/thumbnails/xxlarge.jpg"
                        data-keyword="famous landmarks"
                        alt="Landmark illustration"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://res-dev.cdn.officeppe.net/m365content/publish/2726fcef-98f3-490e-a297-f75d644ff043/thumbnails/xxlarge.jpg";
                        }}
                        className="h-40 w-full object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">No towns found</p>
                      <p className="text-muted-foreground text-sm">
                        The GeorgTown table currently has no records to display.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <Separator className="my-6" />
              <div className="text-xs text-muted-foreground">
                Data is loaded live from Dataverse. If you do not see expected records, ensure you have access permissions.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}