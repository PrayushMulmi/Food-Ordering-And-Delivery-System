import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "../shared/ui";
import { Input } from "../shared/ui";
import { Label } from "../shared/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../shared/ui";
import { Switch } from "../shared/ui";
import { User, Settings, Bell, Shield, LogOut } from "lucide-react";
import { toast } from "sonner";
function UserProfile() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-white", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-5xl font-bold mb-8", children: "My Profile" }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "profile", className: "space-y-8", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-4 h-14", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "profile", className: "text-base", children: [
          /* @__PURE__ */ jsx(User, { className: "mr-2 h-4 w-4" }),
          "Profile"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "preferences", className: "text-base", children: [
          /* @__PURE__ */ jsx(Settings, { className: "mr-2 h-4 w-4" }),
          "Preferences"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "notifications", className: "text-base", children: [
          /* @__PURE__ */ jsx(Bell, { className: "mr-2 h-4 w-4" }),
          "Notifications"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "security", className: "text-base", children: [
          /* @__PURE__ */ jsx(Shield, { className: "mr-2 h-4 w-4" }),
          "Security"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "profile", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border-2 border-gray-200 rounded-2xl p-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-6", children: "Personal Information" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleUpdateProfile, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "fullName", children: "Full Name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "fullName",
                  defaultValue: "John Doe",
                  className: "h-12 mt-2"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email Address" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "email",
                  type: "email",
                  defaultValue: "john@example.com",
                  className: "h-12 mt-2"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "phone", children: "Phone Number" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "phone",
                  defaultValue: "+977 9812345678",
                  className: "h-12 mt-2"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "location", children: "Location" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "location",
                  defaultValue: "Kathmandu, Nepal",
                  className: "h-12 mt-2"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "address", children: "Delivery Address" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "address",
                defaultValue: "123 Main Street, Kathmandu",
                className: "h-12 mt-2"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              className: "bg-[#22C55E] hover:bg-[#16A34A] text-white w-full md:w-auto px-8",
              children: "Save Changes"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "preferences", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border-2 border-gray-200 rounded-2xl p-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-6", children: "Food Preferences" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Dietary Restrictions" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3 mt-3", children: ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Halal", "None"].map(
              (pref) => /* @__PURE__ */ jsxs(
                "label",
                {
                  className: "flex items-center gap-2 cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx("input", { type: "checkbox", className: "h-4 w-4" }),
                    /* @__PURE__ */ jsx("span", { children: pref })
                  ]
                },
                pref
              )
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Favorite Cuisines" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3 mt-3", children: ["Italian", "Chinese", "Indian", "Japanese", "Mexican", "Thai"].map(
              (cuisine) => /* @__PURE__ */ jsxs(
                "label",
                {
                  className: "flex items-center gap-2 cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx("input", { type: "checkbox", className: "h-4 w-4" }),
                    /* @__PURE__ */ jsx("span", { children: cuisine })
                  ]
                },
                cuisine
              )
            ) })
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "bg-[#22C55E] hover:bg-[#16A34A] text-white", children: "Save Preferences" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "notifications", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border-2 border-gray-200 rounded-2xl p-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-6", children: "Notification Settings" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-4 border-b", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Push Notifications" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Receive updates about your orders" })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: notifications,
                onCheckedChange: setNotifications
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-4 border-b", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Email Updates" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Receive promotional emails and offers" })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: emailUpdates,
                onCheckedChange: setEmailUpdates
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Order Status Updates" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Get notified when order status changes" })
            ] }),
            /* @__PURE__ */ jsx(Switch, { defaultChecked: true })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "security", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border-2 border-gray-200 rounded-2xl p-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-6", children: "Security Settings" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "currentPassword", children: "Current Password" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "currentPassword",
                type: "password",
                className: "h-12 mt-2"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "newPassword", children: "New Password" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "newPassword",
                type: "password",
                className: "h-12 mt-2"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", children: "Confirm New Password" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "confirmPassword",
                type: "password",
                className: "h-12 mt-2"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "bg-[#22C55E] hover:bg-[#16A34A] text-white", children: "Update Password" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 pt-8 border-t", children: /* @__PURE__ */ jsxs(Button, { variant: "destructive", className: "w-full md:w-auto", children: [
          /* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }),
          "Logout"
        ] }) })
      ] }) })
    ] })
  ] }) }) });
}
export {
  UserProfile
};
