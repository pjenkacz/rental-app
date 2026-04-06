import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./routes/layout/layout";
import HomePage from "./routes/homePage/homePage";
import ListPage from "./routes/listPage/listPage";
import SinglePage from "./routes/singlePage/singlePage";
import ProfileLayout from "./routes/profilePage/ProfileLayout";
import ProfileOverviewPage from "./routes/profilePage/ProfileOverviewPage";
import ProfileListingsPage from "./routes/profilePage/ProfileListingsPage";
import ProfileSavedPage from "./routes/profilePage/ProfileSavedPage";
import ProfileSettingsPage from "./routes/profilePage/ProfileSettingsPage";
import NewListingPage from "./routes/newListingPage/NewListingPage";
import EditListingPage from "./routes/editListingPage/EditListingPage";
import MessagesPage from "./routes/messagesPage/MessagesPage";
import NotFoundPage from "./routes/notFoundPage/NotFoundPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "listings", element: <ListPage /> },
      { path: "listings/:id", element: <SinglePage /> },

      // Chronione routes — wymagają zalogowania
      {
        element: <ProtectedRoute />,
        children: [
          { path: "listings/new", element: <NewListingPage /> },
          { path: "listings/:id/edit", element: <EditListingPage /> },
          { path: "messages", element: <MessagesPage /> },
          { path: "messages/:conversationId", element: <MessagesPage /> },
          {
            path: "profile",
            element: <ProfileLayout />,
            children: [
              { index: true, element: <ProfileOverviewPage /> },
              { path: "listings", element: <ProfileListingsPage /> },
              { path: "saved", element: <ProfileSavedPage /> },
              { path: "settings", element: <ProfileSettingsPage /> },
            ],
          },
        ],
      },

      // 404
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
