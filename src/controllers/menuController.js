import Products from '../models/productsModel.js';

export const getHome = (req, res) => {
  res.redirect('/menu/pizzas');
};

export const getProducts = async (req, res, next) => {
  try {
    const category = req.params.category;
    const itemsToShow = (await Products.getProductsByCategory(category)) || [];

    return res.render('userViews/menu', {
      paginaAtual: 'home',
      itemsToShow,
      categoriaAtiva: category,
    });
  } catch (error) {
    next(error);
  }
};
