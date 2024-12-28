import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Loading from "../Loading";
import { toast } from "react-toastify";

const OrderMenu = ({ selectedTable, onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState("TẤT CẢ");
  const [categories, setCategories] = useState(["TẤT CẢ"]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);

  const handleAddToCart = async (product) => {
    if (!selectedTable) {
      toast.error("Vui lòng chọn bàn trước khi thêm sản phẩm vào giỏ hàng!");
      return;
    }

    // Log ID của bàn, sản phẩm và số lượng
    console.log("Bàn ID:", selectedTable._id); // ID của bàn
    console.log("Sản phẩm ID:", product._id); // ID của sản phẩm
    console.log("Số lượng:", product.quantity); // Số lượng của sản phẩm

    try {
      // Gửi yêu cầu API để thêm sản phẩm vào giỏ hàng của bàn
      const response = await axios.put(
        `http://localhost:5000/api/tables/${selectedTable._id}/addProduct`,
        {
          productId: product._id,
          quantity: product.quantity,
          totalPrice: product.sell_price * product.quantity, // Tính tổng giá của sản phẩm
        },
      );

      if (response.data.success) {
        toast.success("Thêm vào giỏ hàng thành công!");
        // Cập nhật giỏ hàng nếu cần thiết (nếu bạn muốn làm điều này sau khi nhận phản hồi từ server)
        if (onAddToCart) onAddToCart(response.data.updatedCartItem);
      } else {
        toast.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
      toast.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/mainPages/activeCategories",
        );
        const categoryData = response.data.data.map(
          (category) => category.name,
        );
        setCategories(["TẤT CẢ", ...categoryData]);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/mainPages/activeProducts",
        );
        const productData = response.data.data.map((product) => ({
          ...product,
          quantity: 1, // Set default quantity to 1
        }));
        setProducts(productData);
      } catch (error) {
        console.error("Error fetching products:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  const handleQuantityChange = (id, value) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === id
          ? { ...product, quantity: Math.max(product.quantity + value, 1) }
          : product,
      ),
    );
  };

  const handleInputChange = (id, e) => {
    const value = e.target.value;
    if (value === "") {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...product, quantity: "" } : product,
        ),
      );
    } else {
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue) && numericValue >= 1) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === id
              ? { ...product, quantity: numericValue }
              : product,
          ),
        );
      }
    }
  };

  const handleBlur = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === id
          ? {
              ...product,
              quantity: product.quantity === "" ? 1 : product.quantity,
            }
          : product,
      ),
    );
  };

  const filteredProducts =
    activeCategory === "TẤT CẢ"
      ? products.filter((item) => item.category?.isActive === 1)
      : products.filter((item) => item.category.name === activeCategory);

  return (
    <div className="p-5 text-center">
      {/* Danh sách danh mục */}
      <div className="flex justify-center pb-4 font-bold">
        {categories.map((category) => (
          <button
            key={category}
            className={`mt-8 border-[0.5px] border-gray-300 px-5 py-2 text-base transition-all ease-linear ${
              activeCategory === category
                ? "border-[#633c02] bg-[#633c02] text-white"
                : "bg-white text-gray-800"
            } hover:bg-[#d88453]`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Danh sách sản phẩm */}
      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <Loading />
        </div>
      ) : (
        <div className="mx-auto h-[530px] max-w-4xl overflow-y-scroll">
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredProducts.map((item) => (
              <div
                key={item._id}
                className="flex min-h-[190px] cursor-pointer items-center gap-4 rounded-xl border-2 border-gray-300 p-4 hover:bg-gray-100"
              >
                {/* Ảnh sản phẩm */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-32 w-auto object-cover"
                />

                {/* Thông tin sản phẩm */}
                <div className="flex-1">
                  <h6 className="line-clamp-2 w-[204px] pb-4 pr-4 text-start text-lg font-bold text-[#00561e]">
                    {item.name}
                  </h6>
                  <p className="pb-2 text-start text-lg font-bold text-[#925802]">
                    {item.sell_price.toLocaleString()} đ
                    {item.price !== item.sell_price && (
                      <span className="price-old ml-2 text-sm font-bold text-[#999] line-through">
                        {item.price.toLocaleString()} đ
                      </span>
                    )}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full border text-black hover:bg-gray-200"
                      onClick={() => handleQuantityChange(item._id, -1)}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(item._id, e)}
                      onBlur={() => handleBlur(item._id)}
                      className="h-8 w-12 rounded-md border text-center"
                    />
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full border text-black hover:bg-gray-200"
                      onClick={() => handleQuantityChange(item._id, 1)}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                    {/* Nút thêm vào giỏ hàng */}
                    <button
                      className="ml-10 flex h-12 w-12 items-center justify-center rounded-full border bg-orange-950 font-bold text-white"
                      onClick={() => handleAddToCart(item)}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderMenu;
