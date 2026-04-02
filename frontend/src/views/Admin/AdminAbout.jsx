// v2 update
import { Save, Plus, Trash2, Clock, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "../../shared/ui";
import { Input } from "../../shared/ui";
import { ImageWithFallback } from "../../shared/ui";

const initialInfo = {
  name: "Serene Cafe",
  description:
    "Welcome to Serene Cafe, where culinary excellence meets warm hospitality. Established in 2015, we've been serving authentic and delicious food to our beloved community in Kathmandu. Our chefs use only the freshest ingredients to create memorable dining experiences.",
  address: "Bouddha, Kathmandu, Nepal",
  phone: "+977 1-234-5678",
  email: "contact@serenecafe.com",
  openingHours: [
    { day: "Monday - Friday", hours: "9:00 AM - 10:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 11:00 PM" },
    { day: "Sunday", hours: "10:00 AM - 9:00 PM" },
  ],
  images: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
  ],
};

export function AdminAbout() {
  const [info, setInfo] = useState(initialInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [newHourDay, setNewHourDay] = useState("");
  const [newHourTime, setNewHourTime] = useState("");
  const [newImage, setNewImage] = useState("");

  const handleSave = () => {
    setIsEditing(false);
    alert("Restaurant information updated successfully!");
  };

  const handleAddHour = () => {
    if (newHourDay && newHourTime) {
      setInfo({
        ...info,
        openingHours: [...info.openingHours, { day: newHourDay, hours: newHourTime }],
      });
      setNewHourDay("");
      setNewHourTime("");
    }
  };

  const handleRemoveHour = (index) => {
    setInfo({
      ...info,
      openingHours: info.openingHours.filter((_, i) => i !== index),
    });
  };

  const handleAddImage = () => {
    if (newImage) {
      setInfo({
        ...info,
        images: [...info.images, newImage],
      });
      setNewImage("");
    }
  };

  const handleRemoveImage = (index) => {
    setInfo({
      ...info,
      images: info.images.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">About Restaurant</h1>
        <div className="flex gap-4">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
            >
              Edit Information
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Restaurant Name</label>
              {isEditing ? (
                <Input
                  value={info.name}
                  onChange={(e) => setInfo({ ...info, name: e.target.value })}
                  className="text-xl"
                />
              ) : (
                <p className="text-2xl font-bold">{info.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              {isEditing ? (
                <textarea
                  value={info.description}
                  onChange={(e) => setInfo({ ...info, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#22C55E] focus:outline-none"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{info.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                <MapPin className="inline h-4 w-4 mr-2" />
                Address
              </label>
              {isEditing ? (
                <Input
                  value={info.address}
                  onChange={(e) => setInfo({ ...info, address: e.target.value })}
                />
              ) : (
                <p className="text-gray-700">{info.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Phone
              </label>
              {isEditing ? (
                <Input
                  value={info.phone}
                  onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                />
              ) : (
                <p className="text-gray-700">{info.phone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={info.email}
                  onChange={(e) => setInfo({ ...info, email: e.target.value })}
                />
              ) : (
                <p className="text-gray-700">{info.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              <Clock className="inline h-6 w-6 mr-2" />
              Opening Hours
            </h2>
          </div>

          <div className="space-y-4 mb-6">
            {info.openingHours.map((hour, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{hour.day}</p>
                  <p className="text-gray-600">{hour.hours}</p>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveHour(index)}
                    className="hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="border-t pt-6">
              <p className="font-semibold mb-4">Add New Hours</p>
              <div className="flex gap-4">
                <Input
                  placeholder="Day(s) e.g., Monday - Friday"
                  value={newHourDay}
                  onChange={(e) => setNewHourDay(e.target.value)}
                />
                <Input
                  placeholder="Hours e.g., 9:00 AM - 10:00 PM"
                  value={newHourTime}
                  onChange={(e) => setNewHourTime(e.target.value)}
                />
                <Button
                  onClick={handleAddHour}
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Restaurant Images */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Restaurant Images</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {info.images.map((image, index) => (
              <div key={index} className="relative group">
                <ImageWithFallback
                  src={image}
                  alt={`Restaurant ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="border-t pt-6">
              <p className="font-semibold mb-4">Add New Image</p>
              <div className="flex gap-4">
                <Input
                  placeholder="Image URL"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddImage}
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Image
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
