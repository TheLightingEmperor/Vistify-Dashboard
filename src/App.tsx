import { HiddenPagesButton, HiddenPagesDrawer } from "@/features/hidden-pages";
import { ContactsTab } from "@/features/contacts-tab";
import { EmailsTab } from "@/features/emails-tab";
import { RestaurantsTab } from "@/features/restaurants-tab";
import { SiteHeader } from "@/components/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavProvider, useNav, type TabId } from "@/lib/nav";
import { ToastProvider } from "@/lib/toast";

function Pages() {
  const { tab } = useNav();
  // All three tabs stay mounted (just hidden) so filters, search and pagination survive switching.
  const panel = (id: TabId) => ({ id: `panel-${id}`, role: "tabpanel", hidden: tab !== id });
  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <section {...panel("restaurants")}>
        <RestaurantsTab active={tab === "restaurants"} />
      </section>
      <section {...panel("contacts")}>
        <ContactsTab active={tab === "contacts"} />
      </section>
      <section {...panel("emails")}>
        <EmailsTab active={tab === "emails"} />
      </section>
    </main>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <TooltipProvider delayDuration={200}>
        <NavProvider>
          <SiteHeader />
          <Pages />
          <HiddenPagesButton />
          <HiddenPagesDrawer />
        </NavProvider>
      </TooltipProvider>
    </ToastProvider>
  );
}
